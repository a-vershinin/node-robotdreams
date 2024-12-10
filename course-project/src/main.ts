import { NestFactory } from "@nestjs/core";
import { AppModule } from "./core/app/app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle("Social-network API")
    .setVersion("1.0")
    .addServer("http://localhost:3000")
    .addBearerAuth({
      type: "apiKey",
      name: "access_token",
    })
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, documentFactory);

  await app.listen(3000);
  const appUrl = await app.getUrl();
  console.log(`Application is running on: ${appUrl}`);
}
bootstrap();
