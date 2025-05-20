from supabase import create_client
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Supabase clients
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not all([supabase_url, supabase_key, service_role_key]):
    raise ValueError("Missing Supabase credentials in environment variables")

# Client for auth operations
supabase = create_client(supabase_url, supabase_key)

# Client with service role for database operations that bypass RLS
supabase_admin = create_client(supabase_url, service_role_key)
