#version 450 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec4 aColor;
layout (location = 2) in vec2 aTexCoords;

layout (location=0) out vec4 vClrCoord;
layout (location=1) out vec2 vTexCoord;

layout (std140, binding = 1) uniform Camera
{
  mat4 projection;
  mat4 view;
};

layout (std140, binding = 3) uniform Spine
{
  mat4 model;
  mat4 scaleOffset;
};

void main()
{
    vTexCoord = aTexCoords;
    vClrCoord = aColor;
    gl_Position = projection * view * model * scaleOffset * vec4(aPos, 1.0);
}
