import { Module } from "@nestjs/common";
import { BookingService } from "./booking.service";
import { BookingController } from "./booking.controller";
import { AuthModule } from "../auth/auth.module";
import { WalletModule } from "../wallet/wallet.module";

@Module({
  imports: [AuthModule, WalletModule],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
