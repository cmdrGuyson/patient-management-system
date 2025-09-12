import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
} from "class-validator";

export class CreatePatientDto {
  @IsString({ message: "First name must be a string" })
  @IsNotEmpty({ message: "First name is required" })
  firstName: string;

  @IsString({ message: "Last name must be a string" })
  @IsNotEmpty({ message: "Last name is required" })
  lastName: string;

  @IsEmail({}, { message: "Please provide a valid email address" })
  @IsNotEmpty({ message: "Email is required" })
  email: string;

  @IsString({ message: "Phone number must be a string" })
  @IsNotEmpty({ message: "Phone number is required" })
  phoneNumber: string;

  @IsDateString({}, { message: "Date of birth must be a valid date" })
  @IsNotEmpty({ message: "Date of birth is required" })
  dob: string;

  @IsString({ message: "Additional information must be a string" })
  @IsOptional()
  additionalInformation?: string;
}
