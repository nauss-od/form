
document.addEventListener('DOMContentLoaded', function(){
  const roleBtn = document.getElementById('roleBtn');
  if(roleBtn){
    roleBtn.addEventListener('click', ()=>{
      const current = roleBtn.dataset.role;
      const next = current === 'manager' ? 'موظف' : 'manager';
      roleBtn.dataset.role = next;
      roleBtn.textContent = next === 'manager' ? 'مدير ▾' : 'موظف ▾';
    });
  }
  const logout = document.getElementById('logoutBtn');
  if(logout){
    logout.addEventListener('click', ()=> alert('تسجيل خروج (تجريبي)'));
  }
});
