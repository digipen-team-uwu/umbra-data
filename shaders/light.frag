#version 450 core

layout (location=0) in vec4 vClrCoord;

layout (location=1) in vec2 vTexCoord;

layout (location=2) in vec3 vNormal;

layout (location=3) in vec3 FragPosition;

layout (location=0) out vec4 fFragClr;

uniform sampler2D myTexture;

layout (std140, binding = 2) uniform Light
{
  float ambientStrength;
  float specularStrength;
  vec3 lightPosition;
  vec3 viewPosition;
  vec4 lightColor;
};

void main () {
  // ambient
  vec4 ambientLight = ambientStrength * lightColor;
  
  // diffuse
  vec3 unitNormal = normalize(vNormal);
  vec3 lightRay = normalize(lightPosition - FragPosition);
  vec4 diffuseLight = max(dot(unitNormal,lightRay), 0.0) * lightColor;
  
  // specular
  vec3 viewDirection = normalize(viewPosition - FragPosition);
  vec3 reflectDirection = reflect(-lightRay, unitNormal);
  vec4 specularLight = specularStrength * pow(max(dot(viewDirection, reflectDirection), 0.0), 32) * lightColor;
  
  // compute light result
  vec4 resultLight = vClrCoord * (ambientLight + diffuseLight + specularLight);
  //resultLight.a = 1.0
  
  // texel
  vec4 texel = texture(myTexture, vTexCoord);
  if (texel.a < 0.05)
    discard;
  texel.rgb *= texel.a;
  
  // final fragment
  fFragClr = texel * resultLight;
}