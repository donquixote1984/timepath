class Profile < ActiveRecord::Base
    include UUIDHelper
    has_one :user
end
