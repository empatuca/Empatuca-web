const fs = require('fs');
let code = fs.readFileSync('src/components/home/OrderModal.tsx', 'utf8');

const oldCode = `                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">`;

const newCode = `                        </div>
                      );
                    })}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/components/home/OrderModal.tsx', code);
