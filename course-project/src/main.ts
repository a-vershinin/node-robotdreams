import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app/app.module";

import { initializeSwagger } from "./utils/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  initializeSwagger(app);

  await app.listen(3000);
  const appUrl = await app.getUrl();
  console.log(`Application is running on: ${appUrl}`);
}
bootstrap();
