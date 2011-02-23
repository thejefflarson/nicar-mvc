require 'rubygems'
require 'nokogiri'
require 'faster_csv'
svg    = File.open("./counties.svg")
nodes  = Nokogiri::XML svg
lookup = Proc.new { |id|
  nodes.css("path##{id.to_s.downcase}").first["d"] if !nodes.css("path##{id.to_s.downcase}").empty?
}

fips = [22001,22003,22005,22007,22009,22011,22013,22015,22017,22019,22021,22023,22025,22027,22029,22031,22033,22035,22037,22039,22041,22043,22045,22047,22049,22051,22053,22055,22057,22059,22061,22063,22065,22067,22069,22071,22073,22075,22077,22079,22081,22083,22085,22087,22089,22091,22093,22095,22097,22099,22101,22103,22105,22107,22109,22111,22113,22115,22117,22119,22121,22123,22125,22127]
FasterCSV.open("./svg.csv", "w") do |csv|
  csv << ["fips", "svg"]
  fips.each do |fips|
    csv << [fips, lookup.call(fips)]
  end
end