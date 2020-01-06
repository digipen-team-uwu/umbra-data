#version 450 core
#define RENDER_COUNT 400

layout (location=0) in vec3 vVertexPosition;
layout (location=1) in vec4 vVertexClrCoord;
layout (location=2) in vec2 vVertexTexCoord;

layout (location=0) out vec4 vClrCoord;
layout (location=1) out vec2 vTexCoord;

layout (std140, binding = 0) uniform Transformation
{
  vec4 translation;
  vec3 scale;
  float rotation;
};

layout (std140, binding = 1) uniform Camera
{
  mat4 projection;
  mat4 view;
};

layout (std140, binding = 2) uniform UVCoordClr
{
  vec4 colorOffset;
  vec2 uvOffset;
  vec2 uvScale;
};

void main() {
  // construct position matrix
  mat4 translatemat = mat4(1.0);
  translatemat[3].xyz = vec3(translation);
  
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
  vClrCoord = vVertexClrCoord + colorOffset;
  vTexCoord = uvOffset + vVertexTexCoord / uvScale;
}
