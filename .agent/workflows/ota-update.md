---
description: Workflow for publishing OTA updates to the preview branch
---

1. Ensure all changes are committed (optional but good practice).
2. Run the EAS update command with a descriptive message:
   ```powershell
   eas update --branch preview --message "<message>"
   ```
   *Replace `<message>` with a brief description of the changes.*
