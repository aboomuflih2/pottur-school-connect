-- VPS Database Functions Migration
-- Generated: 2025-09-18T04:56:07.341Z

-- Function: audit_trigger_function
DROP FUNCTION IF EXISTS audit_trigger_function;

BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (user_id, table_name, action, record_id, old_values)
        VALUES (auth.uid(), TG_TABLE_NAME, TG_OP, OLD.id, to_jsonb(OLD));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (user_id, table_name, action, record_id, old_values, new_values)
        VALUES (auth.uid(), TG_TABLE_NAME, TG_OP, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (user_id, table_name, action, record_id, new_values)
        VALUES (auth.uid(), TG_TABLE_NAME, TG_OP, NEW.id, to_jsonb(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;


-- Function: is_admin
DROP FUNCTION IF EXISTS is_admin;

BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
END;


-- Function: update_updated_at_column
DROP FUNCTION IF EXISTS update_updated_at_column;

BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;


