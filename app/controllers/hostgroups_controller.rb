class HostgroupsController < ApplicationController
  before_filter :tabs

  def index
  end

  def new
    @hostgroup = Hostgroup.new
  end
  
  def show
    @hostgroup = Hostgroup.find params[:id]

    @messages = Message.all_of_hostgroup @hostgroup, params[:page]
    @total_count = Message.count_of_hostgroup @hostgroup
    @last_message = Message.last :conditions => { "host" => { "$in" => @hostgroup.all_conditions } }, :order => "created_at DESC"
  end

  def hosts
    @load_jit = true
    @hostgroup = Hostgroup.find params[:id]
    @new_host = HostgroupHost.new

    @collected_hosts = Host.all_of_group(@hostgroup).sort_by { |h| h.host }
  end

  def settings
    @hostgroup = Hostgroup.find params[:id]
  end

  def create  
    @hostgroup = Hostgroup.new(params[:hostgroup])
    if @hostgroup.save
      redirect_to :controller => 'hosts', :action => 'index'
      flash[:notice] = "Host group has been created."
    else
      flash[:error]  = "Could not create host group."
      render :controller => 'hosts', :action => 'new'
    end
  end

  def rename
    group = Hostgroup.find params[:group_id]
    group.name = params[:name]
    
    if group.save
      flash[:notice] = "Host group has been renamed."
    else
      flash[:error] = "Could not rename host group."
    end

    redirect_to :controller => "hostgroups", :action => "settings", :id => params[:group_id]
  end

  def destroy
    hostgroup = Hostgroup.find params[:id]
 
    if hostgroup.destroy
      flash[:notice] = "<strong>Hostgroup has been deleted</strong>"
    else
      flash[:error] = "<strong>Could not delete hostgroup</strong>"
    end

    redirect_to :controller => "hosts", :action => "index"
  end

  private

  def tabs
    @tabs = [ "Show", "Hosts", "Settings" ]
  end

end
