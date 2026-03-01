uniform vec3 uSunDirection;
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmospherTwilightColor;

varying vec3 vNormal;
varying vec3 vPosition;

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0);

    // sunOrientation : uSunDirection et vNormal sont tous les deux en espace monde
    float sunOrientation = dot(normalize(uSunDirection), normal);

    //Atmosphere
    float atmosphereDayMix = smoothstep(-0.3, 1.0, sunOrientation);
    vec3 atmosphereColor = mix(uAtmospherTwilightColor, uAtmosphereDayColor, atmosphereDayMix);
    color +=  atmosphereColor;

    // Alpha
    float edgeAlpha = dot(viewDirection, normal);
    edgeAlpha = smoothstep(0.0, 0.5, edgeAlpha);

    float dayAlpha = smoothstep(-0.5, 0.0, sunOrientation);

    float alpha = edgeAlpha * dayAlpha * 0.65;

    // Final color
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
