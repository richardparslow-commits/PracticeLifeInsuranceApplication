import { useFormContext, useWatch } from "react-hook-form";
import {
  YesNoField,
  TextField,
  TextAreaField,
  MultiSelectField,
  SelectField,
} from "./fields";
const P = "riskyBehavior";
const activities = [
  "Parachuting",
  "Hang gliding",
  "Rock or mountain climbing",
  "Rodeo events",
  "Sky diving",
  "Skin diving",
  "Scuba diving",
  "Organized racing of any kind",
  "Professional sport",
] as const;
export function RiskySection() {
  const { control } = useFormContext();
  const v = useWatch({ control, name: P }) ?? {};
  const selected: string[] = v.adv_participation ?? [];
  const pilot =
    v.avi_flights_past12m || v.avi_flights_past24m || v.avi_future_2y;
  const climbing = selected.includes("Rock or mountain climbing");
  const racing =
    selected.includes("Organized racing of any kind") ||
    (v.race_intent?.length ?? 0) > 0;
  const diving = selected.some((x) =>
    ["Scuba diving", "Skin diving"].includes(x),
  );
  return (
    <div className="space-y-6">
      <h3 className="font-semibold">Aviation</h3>
      <YesNoField
        name={`${P}.avi_flights_past12m`}
        label="Flights as pilot, student pilot, or crew in the past 12 months?"
      />
      <YesNoField
        name={`${P}.avi_flights_past24m`}
        label="Flights made or contemplated as pilot, student pilot, or crew in the past 24 months?"
      />
      <YesNoField
        name={`${P}.avi_future_2y`}
        label="Do you expect to fly in the next two years?"
      />
      {v.avi_future_2y && (
        <TextAreaField
          name={`${P}.avi_future_details`}
          label="Future flying: aircraft, purpose, locations, and frequency"
        />
      )}
      {pilot && (
        <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
          <SelectField
            name={`${P}.avi_license_type`}
            label="Certificate / license"
            options={["Student", "Private", "Commercial", "ATP", "Other"]}
          />
          <YesNoField
            name={`${P}.avi_accident_grounded_fined`}
            label="Aircraft accident, grounded, fined, or reprimanded?"
          />
          {v.avi_accident_grounded_fined && (
            <TextAreaField
              name={`${P}.avi_accident_details`}
              label="Incident dates and details"
            />
          )}
          <TextField
            name={`${P}.avi_hours_pilot`}
            label="Total pilot hours"
            type="number"
          />
          <TextField
            name={`${P}.avi_hours_crew`}
            label="Total crew hours"
            type="number"
          />
          <TextAreaField
            name={`${P}.avi_schedule_flying_time`}
            label="Schedule of flying time by category"
          />
          <TextAreaField
            name={`${P}.avi_other_flying_details`}
            label="Other types of flying and aircraft flown"
          />
        </div>
      )}
      <h3 className="font-semibold">Sports & hazardous activities</h3>
      <MultiSelectField
        name={`${P}.adv_participation`}
        label="Select all activities that apply (leave empty if none)"
        options={activities}
      />
      {climbing && (
        <div className="space-y-4 rounded-lg border p-4">
          <h4 className="font-semibold">Climbing</h4>
          <TextField
            name={`${P}.climb_years`}
            label="Years climbing and frequency"
          />
          <TextField name={`${P}.climb_regions`} label="Locations / regions" />
          <TextAreaField
            name={`${P}.climb_nature`}
            label="Terrain, difficulty, height, and seasons"
          />
          <TextField
            name={`${P}.climb_bolts`}
            label="Proportion on bolt-protected routes"
          />
          <TextField
            name={`${P}.climb_no_rope`}
            label="Solo climbing or climbing without rope"
          />
        </div>
      )}
      <MultiSelectField
        name={`${P}.race_intent`}
        label="Automobile or hydroplane racing (leave empty if none)"
        options={["Automobile", "Hydroplane"]}
      />
      {racing && (
        <div className="space-y-4 rounded-lg border p-4">
          <h4 className="font-semibold">Racing</h4>
          <TextField name={`${P}.race_track`} label="Track type" />
          <YesNoField
            name={`${P}.race_professional`}
            label="Professional racing or racing for cash prizes?"
          />
          <TextField
            name={`${P}.race_last_date`}
            label="Date of last race"
            type="date"
          />
        </div>
      )}
      {diving && (
        <div className="space-y-4 rounded-lg border p-4">
          <h4 className="font-semibold">Diving</h4>
          <YesNoField
            name={`${P}.dive_certified`}
            label="Certified skin / scuba diver?"
          />
          {v.dive_certified === true && (
            <>
              <TextField
                name={`${P}.dive_instruction_hours`}
                label="Hours of instruction"
                type="number"
              />
              <TextField
                name={`${P}.dive_certification_date`}
                label="Certification date"
                type="date"
              />
            </>
          )}
          {v.dive_certified === false && (
            <TextField
              name={`${P}.dive_not_certified_reason`}
              label="Reason not certified"
            />
          )}
          <TextField
            name={`${P}.dive_max_depth`}
            label="Maximum depth (include units)"
          />
          <TextAreaField
            name={`${P}.dive_schedule`}
            label="Number of dives and average time underwater by depth"
          />
          <TextAreaField name={`${P}.dive_equipment`} label="Equipment used" />
          <MultiSelectField
            name={`${P}.dive_locations`}
            label="Diving locations"
            options={[
              "Lakes and Rivers",
              "Ocean Beaches",
              "Deep Sea",
              "Bays and Inlets",
              "Others",
            ]}
          />
          <YesNoField
            name={`${P}.dive_salvage_exploration`}
            label="Salvage / exploration diving?"
          />
          <YesNoField
            name={`${P}.dive_club_member`}
            label="Organized diving club membership?"
          />
        </div>
      )}
    </div>
  );
}
