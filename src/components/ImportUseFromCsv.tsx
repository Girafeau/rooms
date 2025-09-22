import { useState } from "react";
import { supabase } from "../lib/supabase";
import Papa from "papaparse";

export default function CSVUploader() {
  const [logs, setLogs] = useState<string[]>([]);

  const handleFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as Record<string, string>[];
        for (const row of rows) {
          try {
            const roomName = row["Nom de la salle"];
            const user_full_name = row["Emprunteur"];
            const startDate = row["Date de début"];
            const startTime = row["Heure de début"];
            const endTime = row["Heure de fin"];

            // Vérification minimale
            if (!roomName || !user_full_name || !startDate || !startTime) {
              setLogs((prev) => [...prev, `Ignoré: ligne incomplète`]);
              continue;
            }

            // Récupérer juste le numéro de la salle
            const match = roomName.match(/\d+/);
            if (!match) {
              setLogs((prev) => [...prev, `Ignoré: impossible de récupérer le numéro de salle`]);
              continue;
            }
            const room_number = match[0];

            // Parse date en ISO
            const [day, month, year] = startDate.split(/[\/\-]/).map(Number);
            const startISO = `${year.toString().padStart(4, "0")}-${month
              .toString()
              .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

            const entry_time = new Date(`${startISO}T${startTime}:00`).toISOString();
            let exit_time: string | null = null;
            let max_duration = 0;

            if (endTime && endTime.trim() !== "") {
              exit_time = new Date(`${startISO}T${endTime}:00`).toISOString();
              const [h1, m1] = startTime.split(":").map(Number);
              const [h2, m2] = endTime.split(":").map(Number);
              max_duration = h2 * 60 + m2 - (h1 * 60 + m1);
              if (max_duration < 0) max_duration += 24 * 60; // dépasse minuit
            }

            // Insert en Supabase
            const { error } = await supabase.from("uses").insert([
              { room_number, user_full_name, entry_time, exit_time, max_duration },
            ]);
            if (error) throw error;

            setLogs((prev) => [
              ...prev,
              `✅ ${user_full_name} -> ${room_number} le ${startDate} de ${startTime}${
                endTime ? ` à ${endTime}` : ""
              }`,
            ]);
          } catch (err) {
            console.error(err);
            setLogs((prev) => [...prev, `❌ Erreur lors de l’insertion d’une ligne`]);
          }
        }
      },
    });
  };

  return (
    <div className="flex flex-col gap-2 p-4">
      <input
        type="file"
        accept=".csv"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <div className="border p-2 h-40 overflow-auto text-sm">
        {logs.map((line, idx) => (
          <p key={idx}>{line}</p>
        ))}
      </div>
    </div>
  );
}
