const fs = require('fs');
let code = fs.readFileSync('src/components/home/OrderModal.tsx', 'utf8');

const replacement = `                  </div>
                </div>

                {(orderType === 'llevar' || orderType === 'delivery') && (
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3 mt-4">
                    <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800 leading-snug font-medium">
                      <span className="font-bold">Importante:</span> Al presionar "Enviar Pedido", se abrirá WhatsApp. Por ahí deberás confirmar tu {orderType === 'llevar' ? 'hora de retiro' : 'hora de entrega'} y enviar el comprobante de pago si eliges transferencia.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex gap-3">`;

code = code.replace(/                  <\/div>\n                <\/div>\n              <\/div>\n\n              <div className="pt-4 border-t border-gray-100 flex gap-3">/, replacement);

fs.writeFileSync('src/components/home/OrderModal.tsx', code);
