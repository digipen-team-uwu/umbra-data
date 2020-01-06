#version 450 core
layout (location = 0) in vec2 aPos;

layout (location=0) out vec4 vClrCoord;

layout (std140, binding = 1) uniform Camera
{
  mat4 projection;
  mat4 view;
};

uniform mat4 model;

void main()
{
    vClrCoord = vec4(0, 1, 0, 1);
    gl_Position = projection * view * model * vec4(aPos, 1.0, 1.0);
}
