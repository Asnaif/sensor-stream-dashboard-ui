# Demo sensor data fallback

## Build
- Add realistic, time-stamped demo readings for temperature, humidity, and air quality.
- Use demo readings automatically when the live API cannot be reached.
- Feed the same readings into the latest-value labels, charts, and data table.
- Clearly label demo mode so test values are not mistaken for live ESP32 readings.

## Technical details
- Keep live API polling as the first choice.
- Generate recent readings within the active date ranges so charts are populated immediately.
- Preserve existing filtering, table search, pagination, export, and refresh behavior.
- Verify the dashboard renders without errors.
