package com.blogplatform.config;

import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    bearerFormat = "JWT",
    scheme = "bearer"
)
public class SwaggerConfig {

    @Bean
    public OpenAPI blogPlatformOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Blogging Platform API")
                .description("RESTful API for the Inkwell Blogging Platform")
                .version("1.0.0")
                .contact(new Contact()
                    .name("Blog Platform")
                    .email("dev@blogplatform.com"))
                .license(new License()
                    .name("MIT")
                    .url("https://opensource.org/licenses/MIT")));
    }
}
