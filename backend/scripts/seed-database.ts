import { supabase } from '../src/lib/supabase'

async function seedDatabase() {
  console.log('Seeding database with initial data...')

  try {
    // Insert base services
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .upsert([
        {
          name: 'timer',
          display_name: 'Timer',
          description: 'Time-based triggers and scheduling',
          icon_url: '/icons/timer.svg'
        },
        {
          name: 'mock',
          display_name: 'Mock Service',
          description: 'Mock service for testing and development',
          icon_url: '/icons/mock.svg'
        },
        {
          name: 'logger',
          display_name: 'Logger',
          description: 'Logging and notification service',
          icon_url: '/icons/logger.svg'
        }
      ], { onConflict: 'name' })
      .select()

    if (servicesError) throw servicesError

    console.log('✅ Services seeded')

    // Get service IDs
    const timerService = services.find(s => s.name === 'timer')
    const mockService = services.find(s => s.name === 'mock')
    const loggerService = services.find(s => s.name === 'logger')

    // Insert service actions
    const { error: actionsError } = await supabase
      .from('service_actions')
      .upsert([
        {
          service_id: timerService?.id,
          name: 'every_minute',
          display_name: 'Every Minute',
          description: 'Triggers every minute',
          polling_supported: true,
          webhook_supported: false
        },
        {
          service_id: timerService?.id,
          name: 'every_hour',
          display_name: 'Every Hour',
          description: 'Triggers every hour',
          polling_supported: true,
          webhook_supported: false
        },
        {
          service_id: mockService?.id,
          name: 'random_trigger',
          display_name: 'Random Trigger',
          description: 'Randomly triggers for testing',
          polling_supported: true,
          webhook_supported: false
        }
      ], { onConflict: 'service_id,name' })

    if (actionsError) throw actionsError

    console.log('✅ Service actions seeded')

    // Insert service reactions
    const { error: reactionsError } = await supabase
      .from('service_reactions')
      .upsert([
        {
          service_id: loggerService?.id,
          name: 'log_message',
          display_name: 'Log Message',
          description: 'Logs a message to console'
        },
        {
          service_id: mockService?.id,
          name: 'mock_action',
          display_name: 'Mock Action',
          description: 'Performs a mock action for testing'
        }
      ], { onConflict: 'service_id,name' })

    if (reactionsError) throw reactionsError

    console.log('✅ Service reactions seeded')
    console.log('🎉 Database seeding completed!')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase()