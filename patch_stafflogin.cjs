const fs = require('fs');
let code = fs.readFileSync('src/pages/StaffLogin.tsx', 'utf8');
code = code.replace('import { useState, useEffect } from "react";', 'import React, { useState, useEffect } from "react";');
fs.writeFileSync('src/pages/StaffLogin.tsx', code);
