// services/adminService.js
import { http } from './http';

const soDigitos = (s) => String(s ?? '').replace(/\D/g, '');
const isObj = (d) => d && typeof d === 'object' && !Array.isArray(d);

export const AdminService = {
  /** 👥 Lista de usuários (backend retorna array ou { items, total } em alguns casos) */
  listarUsuarios() {
    return http.get('/usuarios', {
      validate: (d) => Array.isArray(d) || isObj(d),
    });
  },

  /** ✅ Aprovar PJ por CNPJ */
  aprovarPJ(cnpj) {
    return http.patch(
      '/admin/aprovar-pj',
      { cnpj: soDigitos(cnpj) },
      { validate: (d) => d === true || isObj(d) } // aceita boolean ou objeto
    );
  },
};
