import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminMetricsService } from "./admin-metrics.service";
import { AuthModule } from "../auth/auth.module";
import { WalletModule } from "../wallet/wallet.module";
import { ChatModule } from "../chat/chat.module";

@Module({
  imports: [AuthModule, WalletModule, ChatModule],
  controllers: [AdminController],
  providers: [AdminMetricsService],
})
export class AdminModule {}
