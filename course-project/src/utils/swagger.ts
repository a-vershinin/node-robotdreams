import { INestApplication } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

export const initializeSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle("Social-network API")
    .setVersion("1.0")
    .addServer("http://localhost:3000")
    .addBearerAuth({
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    })
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, documentFactory, {
    swaggerOptions: {
      defaultModelsExpandDepth: 0,
    },
  });
};
