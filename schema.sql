-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
  user_id UUID PRIMARY KEY,
  rate_per_day NUMERIC NOT NULL DEFAULT 610,
  overtime_rate NUMERIC NOT NULL DEFAULT 76.25,
  cutoff_start_day INTEGER NOT NULL DEFAULT 1,
  cutoff_end_day INTEGER NOT NULL DEFAULT 15,
  salary_day INTEGER NOT NULL DEFAULT 30
);

-- Shifts Table
CREATE TABLE IF NOT EXISTS shifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  date DATE NOT NULL,
  hours_worked NUMERIC NOT NULL DEFAULT 0,
  holiday_type TEXT DEFAULT 'none',
  UNIQUE(user_id, date)
);

-- Payslips Table
CREATE TABLE IF NOT EXISTS payslips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_days INTEGER NOT NULL,
  overtime_hrs NUMERIC NOT NULL,
  total_pay NUMERIC NOT NULL
);

create or replace function auto_delete_old_data()
returns void as $$
begin
  delete from shifts where created_at < now() - interval '2 months';
end;
$$ language plpgsql;

create extension if not exists pg_cron;
select cron.schedule('daily_shift_cleanup', '0 0 * * *', $$select auto_delete_old_data();$$);
