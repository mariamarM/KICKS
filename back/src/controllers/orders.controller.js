import { supabase } from '../config/supabase.js'

export const createOrder = async (req, res) => {
  const { items, shipping_address } = req.body
  const user_id = req.user?.id

  console.log('--- NUEVO INTENTO DE PEDIDO ---')
  console.log('Items recibidos:', JSON.stringify(items))

  try {
    if (!user_id) return res.status(401).json({ error: 'No autorizado' })
    if (!items || items.length === 0) return res.status(400).json({ error: 'Carrito vacío' })

    // 1. Obtener precios reales
    const productIds = items.map(i => i.product_id || i.id).filter(id => id)
    const { data: dbProducts, error: pErr } = await supabase
      .from('products')
      .select('id, price, name')
      .in('id', productIds)

    if (pErr) throw pErr

    // 2. Validar y calcular total
    let calculated_total = 0
    const orderItemsToInsert = []

    for (const item of items) {
      const pId = item.product_id || item.id
      const product = dbProducts.find(p => p.id === pId)
      
      if (!product) {
        console.error(`PRODUCTO NO ENCONTRADO EN DB: ${pId}`)
        return res.status(400).json({ error: `El producto con ID ${pId} no existe en el catálogo` })
      }

      const price = Number(product.price) || 0
      calculated_total += price * (item.quantity || 1)
      
      orderItemsToInsert.push({
        product_id: product.id,
        quantity: item.quantity || 1,
        unit_price: price
      })
    }

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

    if (oErr) throw oErr

    // 4. Insertar los items
    const finalItems = orderItemsToInsert.map(item => ({
      ...item,
      order_id: order.id
    }))

    const { error: iErr } = await supabase.from('order_items').insert(finalItems)
    
    if (iErr) {
      console.error('ERROR INSERTANDO ITEMS:', iErr)
      throw iErr
    }

    console.log('PEDIDO GUARDADO CON ÉXITO. ID:', order.id)
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

import { createClient } from '@supabase/supabase-js'

export const getAllOrders = async (req, res) => {
  try {
    console.log('--- ADMIN: CARGA FORZADA CON CLIENTE NUEVO ---')
    
    // Creamos un cliente "fresco" solo para esta petición
    const supabaseMaster = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data, error } = await supabaseMaster
      .from('orders')
      .select(`
        id, total_amount, status, created_at, user_id, shipping_address,
        order_items (
          id, quantity, unit_price,
          products ( name, image_url )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error con cliente Master:', error)
      return res.status(500).json({ error: error.message })
    }

    console.log(`Resultado final: ${data?.length || 0} pedidos encontrados.`)
    res.json(data || [])
  } catch (err) {
    console.error('ERROR EN CARGA FORZADA:', err)
    res.status(500).json({ error: 'Error interno del servidor' })
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