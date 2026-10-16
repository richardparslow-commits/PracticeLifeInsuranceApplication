import { practiceApplicationSubmitSchema } from "../src/lib/practiceApplication.schema";
export function validApplication() {
  const shape = practiceApplicationSubmitSchema._def.schema.shape;
  const app: Record<string, any> = {};
  for (const [section, raw] of Object.entries(shape)) {
    let schema: any = raw;
    while (schema._def.innerType) schema = schema._def.innerType;
    if (schema._def.typeName !== "ZodObject") continue;
    app[section] = {};
    for (const [key, field] of Object.entries(schema.shape)) {
      let f: any = field;
      while (f._def.innerType) f = f._def.innerType;
      if (f._def.typeName === "ZodBoolean") app[section][key] = false;
      if (f._def.typeName === "ZodArray") app[section][key] = [];
    }
  }
  Object.assign(app.healthMedical, {
    dob: "1980-01-01",
    age: Number(new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", year: "numeric" }).format(new Date())) - 1980,
    stateOfBirth: "TX",
    genderSex: "Male",
  });
  Object.assign(app.nicotineSmoking, {
    nic_ever_used: true,
    nic_used_12m: true,
    nic_type_and_amount: "Synthetic test only",
  });
  Object.assign(app.residencyTravel, {
    res_citizen_or_resident: "U.S. Citizen",
  });
  Object.assign(app.occupationFinancial, {
    occ_current_occupation: "Synthetic test occupation",
    occ_annual_salary: 50000,
  });
  app.optionalContact = {
    contact_name: "Test Applicant",
    contact_email: "test@example.com",
    contact_phone: "5550101234",
  };
  app.consents = { consent_contact: true, consent_disclaimer: true };
  delete app.seizureModule;
  delete app.respiratoryModule;
  delete app.cardioNeuroModule;
  return app;
}
