class CreateProfiles < ActiveRecord::Migration
  def up
    create_table :profiles,:id=>false do |t|
      t.string :id, :null=>false, :primary_key => true
      t.string :name
      t.string :icon
      t.text :detail
      t.integer :age
      t.text :address
      t.string :email
      t.string :city

      t.timestamps
    end
    execute "ALTER TABLE profiles ADD PRIMARY KEY (id);"
  end

  def down
    drop_table :profiles
  end
end
