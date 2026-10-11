import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import cookieParser from "cookie-parser";
import { join } from "path";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  const origin = process.env.WEB_ORIGIN ?? "http://localhost:3000";
  app.enableCors({ origin, credentials: true });
  app.use(cookieParser());
  app.useStaticAssets(join(process.cwd(), "uploads"), { prefix: "/api/uploads/" });
  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  const port = Number(process.env.PORT ?? process.env.API_PORT ?? 4000);
  await app.listen(port, '0.0.0.0');
}

bootstrap();
