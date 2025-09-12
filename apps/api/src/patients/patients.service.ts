import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePatientDto } from "./dto/create-patient.dto";
import { UpdatePatientDto } from "./dto/update-patient.dto";

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a new patient record in the database
   * @param createPatientDto - Patient data to create
   * @returns Promise<Patient> - The created patient record
   */
  create(createPatientDto: CreatePatientDto) {
    return this.prisma.patient.create({ data: createPatientDto });
  }

  /**
   * Retrieves all patient records from the database
   * @returns Promise<Patient[]> - Array of all patient records
   */
  findAll() {
    return this.prisma.patient.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        dob: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Finds a specific patient by their ID
   * @param id - The unique identifier of the patient
   * @returns Promise<Patient> - The patient record if found
   */
  async findOne(id: number) {
    const patient = await this.prisma.patient.findUnique({ where: { id } });
    if (!patient) {
      return null;
    }
    return patient;
  }

  /**
   * Updates an existing patient record with new data
   * @param id - The unique identifier of the patient to update
   * @param updatePatientDto - Partial patient data to update
   * @returns Promise<Patient> - The updated patient record
   */
  update(id: number, updatePatientDto: UpdatePatientDto) {
    return this.prisma.patient.update({
      where: { id },
      data: updatePatientDto,
    });
  }

  /**
   * Permanently deletes a patient record from the database
   * @param id - The unique identifier of the patient to delete
   * @returns Promise<Patient> - The deleted patient record
   */
  remove(id: number) {
    return this.prisma.patient.delete({ where: { id } });
  }
}
