# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
  # always use Vagrants insecure key
  config.ssh.insert_key = false 
  
  config.vm.box = "bento/ubuntu-16.04"
  
  # forward ports for ELK  
  config.vm.network :forwarded_port, guest: 5601, host: 5601
  config.vm.network :forwarded_port, guest: 9200, host: 9200
  config.vm.network :forwarded_port, guest: 5000, host: 5000

  # http-server for riskmap
  config.vm.network :forwarded_port, guest: 8080, host: 8080
  
  # just in case there is a HTTP_PROXY configured for the host 
  # system, the virtual machine is going to use it
  if ENV.has_key?("http_proxy")
    if Vagrant.has_plugin?("vagrant-proxyconf")
      config.proxy.http = ENV["http_proxy"]
      config.proxy.https = ENV.has_key?("https_proxy") ? ENV["https_proxy"] : ENV["http_proxy"]
      config.proxy.no_proxy = ENV.has_key?("no_proxy") ? ENV["no_proxy"] : "localhost,127.0.0.1"
    else
      print "  WARN: Missing plugin 'vagrant-proxyconf'.\n"
      print "  Use 'vagrant plugin install vagrant-proxyconf' to install.\n"
      print "  You might need to set http_proxy to do this, however.\n"
    end   
  end
  
  # lets check for the plugins which make sense or are used
  if Vagrant.has_plugin?("vagrant-cachier")
    # enable package caches
    # machine scope, cf.: http://fgrehm.viewdocs.io/vagrant-cachier/usage/
    config.cache.scope = :machine
  else
    print "  WARN: Missing plugin 'vagrant-cachier'.\n"
    print "  Use 'vagrant plugin install vagrant-cachier' to install.\n"
  end  
  
  if Vagrant.has_plugin?("vagrant-vbguest")
    config.vbguest.auto_update = false
  end
  
  config.vm.provider "virtualbox" do |v|
    v.memory = 4096
    v.cpus = 2
    v.name = "riskmap"
  end
  
  if !Vagrant.has_plugin?("vagrant-docker-compose")
    print "  WARN: Missing plugin 'vagrant-docker-compose'.\n"
    print "  Use 'vagrant plugin install vagrant-docker-compose' to install.\n"
  end  

  # workaround tty issues on ubuntu
  # https://github.com/mitchellh/vagrant/issues/1673#issuecomment-211568829
  config.vm.provision "fix-no-tty", type: "shell" do |s|
      s.privileged = false
      s.inline = "sudo sed -i '/tty/!s/mesg n/tty -s \\&\\& mesg n/' /root/.profile"
  end

  # Increase mmap count for docker host, cf.:
  # https://www.elastic.co/guide/en/elasticsearch/reference/5.0/vm-max-map-count.html  
  config.vm.provision :shell, inline: "echo 'vm.max_map_count=262144' >> /etc/sysctl.d/90-es.conf && sysctl -p /etc/sysctl.d/90-es.conf"

  if ARGV[0] =~ /up|reload|provision/
    if ENV.has_key?("ais_user")
      print "==> Forwarding 'ais_user' environment variable...\n"
      config.ssh.forward_env = ['ais_user']
      config.vm.provision "forward_ais-user", type: "shell" do |s|
        s.inline = "echo 'export ais_user=#{ENV['ais_user']}' >> /etc/environment"
      end
    else
      print "  WARN: environment variable 'ais_user' not set.\n"
      print "  You won't be able to import AIS data from 'aishub.net'.\n"
      print "  See 'http://www.aishub.net/xml-description-20.php' \n"
      print "  Do you want to continue [Y/n]? "
      input = STDIN.gets.strip
      if input == "n" then exit! end
    end
   end    

  config.vm.provision :docker
  config.vm.provision :docker_compose, 
    yml: "/vagrant/docker-compose.yml", 
    #rebuild: true, 
    project_name: "riskmap",
    run: "always"  
end
