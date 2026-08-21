import { IsIn } from "class-validator";

export class SwitchRoleDto {
  @IsIn(["STUDENT", "TUTOR"])
  role: "STUDENT" | "TUTOR";
}
