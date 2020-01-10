#version 450 core

layout (location=0) in vec3 vVertexPosition;
layout (location=1) in vec4 vVertexClrCoord;
layout (location=2) in vec2 vVertexTexCoord;

// instancing data
layout (location=4) in float rotation;
layout (location=5) in vec4 translation;
layout (location=6) in vec3 scale;
layout (location=7) in vec4 colorOffset;
layout (location=8) in vec2 uvOffset;
layout (location=9) in uvec2 uvScale;
layout (location=10) in vec2 atlasUV;
layout (location=11) in vec2 atlasScale;
layout (location=12) in uint atlasLayer;
layout (location=13) in float Shininess;

layout (location=0) out vec4 vClrCoord;
layout (location=1) out vec2 vTexCoord;
layout (location=2) out vec3 vNormal;
layout (location=3) out vec3 FragPos;
layout (location=4) flat out uint layer;
layout (location=5) out float material_shininess;

layout (std140, binding = 1) uniform Camera
{
  mat4 projection;
  mat4 view;
};

void main() {
  // construct position matrix
  mat4 translatemat = mat4(1.0);
  vec3 trans = translation.xyz; //+ abs(scale / 2);
  translatemat[3].xyz = trans;
  
  // construct rotation matrix
  mat4 rotatemat = mat4(1.0);
  rotatemat[0].xy = vec2(cos(rotation),sin(rotation));
  rotatemat[1].xy = vec2(-sin(rotation),cos(rotation));

  // construct scale matrix
  mat4 scalemat = mat4(1.0);
  scalemat[0].x = scale.x;
  scalemat[1].y = scale.y;
  scalemat[2].z = scale.z;
  
  // construct model matrix
  mat4 model = translatemat * rotatemat * scalemat;

  gl_Position = projection * view * model * vec4(vVertexPosition, 1.0);
  
  // calculate frame off set
  vec2 frameOffset = uvOffset / atlasScale;
  
  // Calculate the texture scale
  vec2 textureScale = uvScale * atlasScale;
  
  // Calculate the texture uv
  vec2 textureUV = frameOffset + atlasUV;
  
  // output uv tex coordinates
  vTexCoord = textureUV + vVertexTexCoord / textureScale;

  // output tex's layer  
  layer = atlasLayer;

  // output color
  vClrCoord = vVertexClrCoord + colorOffset;

  // discard objects
  if (uvOffset.x == -1)
  {
    gl_Position = vec4(0.0,0.0,0.0,0.0);
  }
  // 2D game so normal never change -> hardcoded value
  vec3 vVertexNormal = vec3(0.0f,0.0f,1.0f);

  // output normal in view coordinates
  vNormal = mat3(transpose(inverse(model))) * vVertexNormal;

  // output fragment's position in view coordinates
  FragPos = vec3(model * vec4(vVertexPosition, 1.0));

  material_shininess = Shininess;
}
