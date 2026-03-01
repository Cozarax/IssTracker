uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uSpecularCloudsTexture;    
uniform vec3 uSunDirection; 
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmospherTwilightColor;


varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0);

    //sunOrientation
    float sunOrientation = dot(normalize(uSunDirection), normal); // ✅ utilise le vrai uniform
    

    //Day / night color
    float dayMix = smoothstep(-0.05, 0.5, sunOrientation);
    vec3 dayColor = texture(uDayTexture, vUv).rgb;
    vec3 nightColor = texture(uNightTexture, vUv).rgb;
    color = mix(nightColor, dayColor, dayMix);

    //Clouds color
    vec2 specularCloudsColor = texture(uSpecularCloudsTexture, vUv).rg;
   
    //Clouds
    float cloudsMix = smoothstep(0.5, 1.0, specularCloudsColor.g);
    cloudsMix *= dayMix;
    color = mix(color, vec3(1.0), cloudsMix);

    //Fresnel
    float fresnel = dot(viewDirection, normal) + 1.0;
    fresnel = pow(fresnel, 2.0);

    //Atmosphere
    float atmosphereDayMix = smoothstep(-0.5, 1.0, sunOrientation);
    vec3 atmosphereColor = mix(uAtmospherTwilightColor, uAtmosphereDayColor, atmosphereDayMix);
    color = mix(color, atmosphereColor, fresnel * atmosphereDayMix);

    // Specular
    vec3 lightDir = normalize(uSunDirection);
    vec3 reflectDir = reflect(-lightDir, normal);
    float specAngle =  - (dot(reflectDir, viewDirection));
    specAngle = max(specAngle, 0.0); 
    float specular = pow(specAngle, 64.0); // 32 à 128 = zone fine, brillante
    specular *= specularCloudsColor.r;
    vec3 specularColor = mix(vec3(1.0), atmosphereColor, fresnel);

    color += specular * specularColor;





    // Final color  
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}