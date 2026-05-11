import { supabase } from '../config/supabase.js'

export const createOrder = async (req, res) => {
  const { items, shipping_address } = req.body
  const user_id = req.user?.id

  try {
    if (!user_id) return res.status(401).json({ error: 'No autorizado' })
    if (!items || items.length === 0) return res.status(400).json({ error: 'Carrito vacío' })

    // 1. Obtener precios reales de la tabla 'products'
    const productIds = items.map(i => i.product_id || i.id)
    const { data: dbProducts, error: pErr } = await supabase
      .from('products')
      .select('id, price, name')
      .in('id', productIds)

    if (pErr) throw pErr

    // 2. Calcular total real en el servidor
    let calculated_total = 0
    const orderItemsToInsert = items.map(item => {
      const product = dbProducts.find(p => p.id === (item.product_id || item.id))
      const price = product ? Number(product.price) : 0
      calculated_total += price * (item.quantity || 1)
      
      return {
        product_id: product.id,
        quantity: item.quantity || 1,
        unit_price: price // Nombre confirmado por el error de BD
      }
    })

    // 3. Crear el pedido
    const { data: order, error: oErr } = await supabase
      .from('orders')
      .insert({
        user_id,
        total_amount: calculated_total,
        status: 'pending',
        shipping_address: shipping_address || 'Recogida en tienda'
      })
      .select('id')
      .single()

    if (oErr) {
      console.error('ERROR TABLA ORDERS:', oErr)
      return res.status(500).json({ error: oErr.message })
    }

    // 4. Insertar los items con 'unit_price' (YA NO SERÁ NULL)
    const finalItems = orderItemsToInsert.map(item => ({
      ...item,
      order_id: order.id
    }))

    const { error: iErr } = await supabase.from('order_items').insert(finalItems)
    
    if (iErr) {
      console.error('ERROR CRÍTICO AL INSERTAR PRODUCTOS:', iErr)
      return res.status(500).json({ error: 'No se pudieron guardar los productos', details: iErr.message })
    }

    res.status(201).json({ 
      message: 'Pedido realizado con éxito', 
      order_id: order.id,
      total: calculated_total 
    })



  } catch (err) {
    console.error('ERROR CRÍTICO EN CHECKOUT:', err)
    res.status(500).json({ error: 'Error al procesar pedido', details: err.message })
  }
}

export const getUserOrders = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, total_amount, status, created_at,
        order_items (
          id, quantity,
          products ( name, image_url )
        )
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) return res.status(500).json({ error: error.message })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getAllOrders = async (req, res) => {
  try {
    // DIAGNÓSTICO: Ver cuántas filas hay realmente en la tabla
    const { count, error: countErr } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
    
    console.log('--- DIAGNÓSTICO ADMIN ---')
    console.log('Total de pedidos en la tabla:', count)
    if (countErr) console.error('Error al contar:', countErr)

    // Consulta ultra-simple para saltar cualquier error de join
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error en consulta simple:', error)
      return res.status(500).json({ error: error.message })
    }

    console.log('Pedidos encontrados (sin joins):', data?.length)
    res.json(data)
  } catch (err) {
    console.error('Error fatal en getAllOrders:', err)
    res.status(500).json({ error: err.message })
  }
}

export const updateOrderStatus = async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Estado no válido' })
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Pedido no encontrado' })

    res.json(data)
  } catch (err) {
    console.error('Error en updateOrderStatus:', err)
    res.status(500).json({ error: err.message || 'Error al actualizar el estado' })
  }
}