const supabase = window.supabase.createClient(
  "https://gcfesikhojqrppomruwk.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
);

);
let currentUser = null;

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) alert("Login failed: " + error.message);
  else {
    currentUser = data.user;
    document.getElementById("auth-section").classList.add("hidden");
    document.getElementById("tracker-section").classList.remove("hidden");
    loadSettings();
  }
}

async function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) alert("Signup failed: " + error.message);
  else alert("Signup successful! Verify your email before logging in.");
}

async function submitShift() {
  const date = document.getElementById("shift-date").value;
  const hours = parseFloat(document.getElementById("shift-hours").value);
  const holiday = document.getElementById("holiday-type").value;
  await supabase.from("shifts").upsert({
    user_id: currentUser.id,
    date,
    hours_worked: hours,
    holiday_type: holiday,
  });
  alert("Shift saved.");
}

async function saveSettings() {
  const rate = parseFloat(document.getElementById("rate").value);
  const overtime = parseFloat(document.getElementById("overtime").value);
  const cutoffStart = parseInt(document.getElementById("cutoff-start").value);
  const cutoffEnd = parseInt(document.getElementById("cutoff-end").value);
  const salaryDay = parseInt(document.getElementById("salary-day").value);
  await supabase.from("settings").upsert({
    user_id: currentUser.id,
    rate_per_day: rate,
    overtime_rate: overtime,
    cutoff_start_day: cutoffStart,
    cutoff_end_day: cutoffEnd,
    salary_day: salaryDay,
  });
  alert("Settings saved.");
}

async function loadSettings() {
  const { data } = await supabase.from("settings").select("*").eq("user_id", currentUser.id);
  const settings = data?.[0];
  if (settings) {
    document.getElementById("rate").value = settings.rate_per_day;
    document.getElementById("overtime").value = settings.overtime_rate;
    document.getElementById("cutoff-start").value = settings.cutoff_start_day;
    document.getElementById("cutoff-end").value = settings.cutoff_end_day;
    document.getElementById("salary-day").value = settings.salary_day;
  }
}

async function generatePayslip() {
  const rate = parseFloat(document.getElementById("rate").value);
  const overtimeRate = parseFloat(document.getElementById("overtime").value);
  const cutoffStart = parseInt(document.getElementById("cutoff-start").value);
  const cutoffEnd = parseInt(document.getElementById("cutoff-end").value);
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  let start = new Date(year, month, cutoffStart);
  let end = new Date(year, month, cutoffEnd);
  if (cutoffStart > cutoffEnd) start.setMonth(month - 1);
  const { data: shifts } = await supabase
    .from("shifts")
    .select("*")
    .eq("user_id", currentUser.id)
    .gte("date", start.toISOString())
    .lte("date", end.toISOString());

  let totalDays = 0, totalOT = 0, totalPay = 0;
  for (let shift of shifts) {
    const hours = shift.hours_worked;
    const ot = Math.max(0, hours - 9);
    totalDays++;
    totalOT += ot;
    totalPay += rate + ot * overtimeRate;
  }

  document.getElementById("payslip-result").innerText = 
    `Period: ${start.toDateString()} - ${end.toDateString()}
Days Worked: ${totalDays}
Overtime Hours: ${totalOT}
Total Pay: ₱${totalPay.toFixed(2)}`;
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
