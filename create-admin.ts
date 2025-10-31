import { supabase } from './src/lib/supabase';

async function createAdmin() {
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@admin.com',
    password: 'admin123',
    options: {
      data: {
        name: 'Admin User',
      },
    },
  });

  if (error) {
    console.error('Error creating admin:', error.message);
  } else {
    console.log('Admin user created:', data.user?.email);

    // Insert into users table
    if (data.user) {
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            full_name: 'Admin User',
            email: 'admin@admin.com',
          },
        ]);

      if (insertError) {
        console.error('Error inserting admin data:', insertError.message);
      } else {
        console.log('Admin data inserted');
      }
    }
  }
}

createAdmin();