
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cqaaxqruurapltillhzq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxYWF4cXJ1dXJhcGx0aWxsaHpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk5NjkxMDEsImV4cCI6MjA0NTU0NTEwMX0.YTokgJJqvVTLfjFU4KJd2ofjYtt9vfpkwHyWsLFfey8'
export const supabase = createClient(supabaseUrl, supabaseKey)