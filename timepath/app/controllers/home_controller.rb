class HomeController < ApplicationController
  before_filter :auth_user, :except => [:index]  
  def index
     redirect_to home_url if user_signed_in?
  end

  def main
  end

  def auth_user
    redirect_to home_url unless user_signed_in?
  end
end
