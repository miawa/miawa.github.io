 import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

      const supabaseUrl = 'https://fctswjvfkyolhiyzhusb.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdHN3anZma3lvbGhpeXpodXNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTU3ODI2MiwiZXhwIjoyMDY1MTU0MjYyfQ.CAsDZEtYPa9e1hKmufSsofDkAXC1AFLeEk2bN50Gad0';

      export const supabase = createClient(supabaseUrl, supabaseKey);

      export default supabase; 