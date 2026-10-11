import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AuthModule } from "../auth/auth.module";
import { WalletModule } from "../wallet/wallet.module";
import { ChatModule } from "../chat/chat.module";

@Module({
  imports: [AuthModule, WalletModule, ChatModule],
  controllers: [AdminController],
})
export class AdminModule {}
