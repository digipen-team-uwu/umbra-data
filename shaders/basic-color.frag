#version 450 core

layout (location=0) in vec4 vClrCoord;

layout (location=1) in vec2 vTexCoord;

layout (location=2) in vec3 vNormal;
layout (location=3) in vec3 FragPos;

layout (location=4) flat in uint layer;

layout (location=6) in vec3 material_ambient;
layout (location=7) in vec3 material_diffuse;
layout (location=8) in vec3 material_specular;
layout (location=9) in float material_shininess;

layout (location=0) out vec4 fFragClr;

struct PointLight
{
  vec3 position;
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
  float constant;
  float linear;
  float quadratic;
};

layout (std430, binding = 5) buffer PointLights
{
  PointLight pLights[];
};

struct DirectionalLight
{
  vec3 direction;
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
};

layout (std430, binding = 6) buffer DirectionalLights
{
  DirectionalLight dLights[];
};

struct SpotLight
{
  vec3 position;
  vec3 direction;
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
  float constant;
  float linear;
  float quadratic;
  float cutOff;
  float outerCutOff;
};

layout (std430, binding = 7) buffer SpotLights
{
  SpotLight spLights[];
};

layout (std140, binding = 0) uniform Light
{
  vec3 lightPosition;
  vec3 viewPosition;
  vec3 lightAmbient;
  vec3 lightDiffuse;
  vec3 lightSpecular;
};

layout (std140, binding = 4) uniform Material
{
  vec3 materialAmbient;
  vec3 materialDiffuse;
  vec3 materialSpecular;
  float materialShininess;
};

uniform sampler2DArray myTexture;
uniform bool lightOn;

// function prototypes
vec3 CalculatePointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir, vec4 texel);

// main
void main () {
  vec4 texel = texture(myTexture, vec3(vTexCoord, layer));

  if (texel.a < 0.05)
    discard;

  texel.rgb *= texel.a;

  vec3 total_light;
  for (int i = 0; i < pLights.length(); ++i)
  {
    total_light += CalculatePointLight(pLights[i], normalize(vNormal), FragPos,
						normalize(viewPosition - FragPos), texel);
  }

  // ambient
  vec3 ambient = lightAmbient * material_ambient * texel.rgb * vClrCoord.rgb;

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

vec3 CalculatePointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir, vec4 texel)
{
  vec3 lightDirection = normalize(light.position - fragPos);

  // diffuse shading
  float diffuseShading = max(dot(normal, lightDirection), 0.0);

  // specular highlighting
  vec3 reflectDir = reflect(-lightDirection, normal);

  // hardcoded material shininess to 128
  float specularShading = pow(max(dot(viewDir, reflectDir), 0.0), 128.f);

  // attenuation (fading)
  float dist = length(light.position - fragPos);
  float attenuation = 1.0 / (light.constant + light.linear * dist + light.quadratic * (dist * dist));

  // combine
  vec3 ambient = light.ambient * material_ambient * texel.rgb;
  vec3 diffuse = light.diffuse * diffuseShading * material_diffuse * texel.rgb;
  vec3 specular = light.specular * specularShading * material_specular * texel.rgb;
  ambient *= attenuation;
  diffuse *= attenuation;
  specular *= attenuation;
  vec3 final = ambient + diffuse + specular;

  return final;
}