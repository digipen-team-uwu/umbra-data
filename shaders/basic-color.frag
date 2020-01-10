#version 450 core

layout (location=0) in vec4 vClrCoord;
layout (location=1) in vec2 vTexCoord;
layout (location=2) in vec3 vNormal;
layout (location=3) in vec3 FragPos;
layout (location=4) flat in uint layer;
layout (location=5) in float material_shininess;

layout (location=0) out vec4 fFragClr;

// point light bind at 4
// directional light bind at 5
// spot light bind at 6

layout (std140, binding = 0) uniform Light
{
  vec3 lightPosition;
  vec3 viewPosition;
  vec3 lightAmbient;
  vec3 lightDiffuse;
  vec3 lightSpecular;
};

uniform sampler2DArray myTexture;
uniform bool lightOn;

// main
void main () {
  vec4 texel = texture(myTexture, vec3(vTexCoord, layer));

  if (texel.a < 0.05)
    discard;

  texel.rgb *= texel.a;

  // ambient
  vec3 ambient = lightAmbient * texel.rgb * vClrCoord.rgb;

  // diffuse
  vec3 unitNormal = normalize(vNormal);
  vec3 lightRay = normalize(lightPosition - FragPos);
  float diffuseStrength = max(dot(unitNormal,lightRay), 0.0);
  vec3 diffuseLight = lightDiffuse * diffuseStrength * texel.rgb * vClrCoord.rgb;

  // specular
  vec3 viewDirection = normalize(viewPosition - FragPos);
  vec3 reflectDirection = reflect(-lightRay, unitNormal);
  float specularStrength = pow(max(dot(viewDirection, reflectDirection), 0.0), material_shininess);
  vec3 specularLight = lightSpecular * specularStrength * texel.rgb * vClrCoord.rgb;
    
  // compute light result
  vec3 resultLight = (ambient + diffuseLight + specularLight);

  if (lightOn)
  {
    fFragClr = vec4(resultLight, texel.a * vClrCoord.a);
  }
  else
  {
    fFragClr = texel * vClrCoord;
  }
}