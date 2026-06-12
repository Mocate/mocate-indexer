## Agent Indexing form

- Multi-step form
  - Agent information
    - Name
    - Attendant name (optional)
    - Networks rows with "Add" button (network dropdown + optional text input
      for code)
    - Geolocation (picked from browser geolocation API, and reverse geocoded
      with Google Maps API), show map view with indexer's current location and
      agent's detected spot marked. Map should be interactive with retrieved
      coordinates editable by moving agent marker
  - Availability
    - Working days and hours. List all days with checkboxes to the left.
      Checkbox selection reveals the input fields for the start and end hours of
      the selected day beneath it
  - Visibility
    - Logo upload with preview
    - Other images (multiple uploads) with previews

## Agents List view

- Paginated list page with all indexed agents with buttons to click to view
- Agent details page with a tabbed view of "Agent Information", "Availability",
  and "Pictures". Contains all details collected from the form
  - Shows an interactive map view for the address
  - Non-working days shown as unavailable and greyed out. Displays "Open now"
    text for each day if current day and time is within day's working hours.
  - Edit button that navigates to the indexing form with details pre-populated
    for editing. Patches agent's data when saved

## Considerations

- Upgrade to nuxt 4, adhering to new directory structure and patterns
- Use nuxt ui components only. Only create a custom component if no nuxt ui
  component does not suffice.
- Use nuxt and nuxt ui skills.
- Integrate with supabase. Use the supabase skills
- Must be mobile responsive.
- Design inspiration: Use the mobbin MCP.
- Update eslint configuration to match '/Users/pyplacca/Work/Effect
  Studios/!General/Frontend Development
  Guidelines/app-templates/tailwind-nuxt-4/eslint.config.mjs'
