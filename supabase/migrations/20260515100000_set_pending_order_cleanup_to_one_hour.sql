CREATE OR REPLACE FUNCTION public.delete_expired_pending_orders(
  _older_than INTERVAL DEFAULT INTERVAL '1 hour'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  WITH deleted_orders AS (
    DELETE FROM public.orders
    WHERE created_at < now() - _older_than
      AND COALESCE(payment_status, 'pending') = 'pending'
      AND status = 'pending'
      AND melhor_envio_id IS NULL
      AND shipping_label_url IS NULL
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted FROM deleted_orders;

  RETURN COALESCE(v_deleted, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.delete_expired_pending_orders(INTERVAL) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_expired_pending_orders(INTERVAL) TO service_role;

CREATE OR REPLACE FUNCTION public.admin_delete_expired_pending_orders()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'admin_access_required';
  END IF;

  RETURN public.delete_expired_pending_orders(INTERVAL '1 hour');
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_expired_pending_orders() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_delete_expired_pending_orders() TO authenticated;
