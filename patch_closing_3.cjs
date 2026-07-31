const fs = require('fs');
let code = fs.readFileSync('src/components/home/OrderModal.tsx', 'utf8');

code = code.replace(/                        <\/div>\s*\);\s*\}\)\}\s*<\/div>\s*\}\)\s*<\/div>\s*<div className="pt-4 border-t border-gray-100 flex flex-col gap-4">/, 
`                        </div>
                      );
                    })}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">`);

fs.writeFileSync('src/components/home/OrderModal.tsx', code);
