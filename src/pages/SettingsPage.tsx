
import { Settings } from "../components/Settings"
import { Title } from "../components/Title"

export function SettingsPage() {
  

  return (
    <div className="px-4">
        <Title back={true} title="" button={undefined} />
     <Settings />
    </div>
  )
}
