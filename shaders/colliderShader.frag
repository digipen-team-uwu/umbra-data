#version 450 core

layout (location=0) in vec4 vClrCoord;

layout (location=0) out vec4 fFragClr;

void main () { 
  fFragClr = vClrCoord;
}
