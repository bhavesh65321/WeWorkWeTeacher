import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { TutorsModule } from "./tutors/tutors.module";
import { JobsModule } from "./jobs/jobs.module";
import { WalletModule } from "./wallet/wallet.module";
import { ChatModule } from "./chat/chat.module";
import { BookingModule } from "./booking/booking.module";
import { AdminModule } from "./admin/admin.module";
import { PaymentsModule } from "./payments/payments.module";
import { SupportModule } from "./support/support.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ["../../.env", ".env"] }),
    PrismaModule,
    AuthModule,
    TutorsModule,
    JobsModule,
    WalletModule,
    ChatModule,
    BookingModule,
    PaymentsModule,
    SupportModule,
    NotificationsModule,
    AdminModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
