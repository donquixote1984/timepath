module UUIDHelper
  def self.included(base)
    base.class_eval do
      before_create :set_uuid

      def set_uuid
        self.id = UUID.new.generate
      end
    end
  end
end