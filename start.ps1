# Start-Process -FilePath "yarn" -ArgumentList "run start" -WorkingDirectory "$PSScriptRoot" #-WindowStyle Hidden
Start-Process -FilePath "powershell" -ArgumentList "-Command", "yarn run start" -WorkingDirectory "$PSScriptRoot" -WindowStyle Hidden
# Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "yarn run start" -WorkingDirectory "$PSScriptRoot"