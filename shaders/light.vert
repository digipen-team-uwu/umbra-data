#version 450 core

layout (location=0) in vec3 vVertexPosition;
layout (location=1) in vec4 vVertexClrCoord;
layout (location=2) in vec2 vVertexTexCoord;
layout (location=3) in vec3 vVertexNormal;

layout (location=0) out vec4 vClrCoord;
layout (location=1) out vec2 vTexCoord;
layout (location=2) out vec3 vNormal;
layout (location=3) out vec3 FragPosition;

layout (std140, binding = 0) uniform Matrices
{
  mat4 projection;
  mat4 view;
  mat4 model;
};

layout (std140, binding = 1) uniform uvCoord
{
  vec2 uvOffset;
  vec2 uvScale;
};

uniform vec4 colorOffset;

void main() {
  gl_Position = projection * view * model * vec4(vVertexPosition, 1.0);
  vClrCoord = vVertexClrCoord + colorOffset;
  vTexCoord = uvOffset + vVertexTexCoord / uvScale;
  vNormal = mat3(transpose(inverse(model))) * vVertexNormal;
  FragPosition = vec3(model * vec4(vVertexPosition, 1.0));
}
