#-- encoding: UTF-8

#-- copyright
# OpenProject is an open source project management software.
# Copyright (C) 2012-2021 the OpenProject GmbH
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License version 3.
#
# OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
# Copyright (C) 2006-2013 Jean-Philippe Lang
# Copyright (C) 2010-2013 the ChiliProject Team
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
#
# See docs/COPYRIGHT.rdoc for more details.
#++

class Queries::Capabilities::Filters::IdFilter < Queries::Capabilities::Filters::CapabilityFilter
  def type
    :string
  end

  def where
    case operator
    when '='
      value_conditions.join(' OR ')
    when '!'
      "NOT #{value_conditions.join(' AND NOT ')}"
    end
  end

  def split_values
    values.map do |value|
      matches = value.match(/(\w+\/\w+)\/(\w)(\d*)-(\d+)/)

      if matches
        {
          permission_map: matches[1],
          context_key: matches[2],
          context_id: matches[3],
          principal_id: matches[4]
        }
      end
    end
  end

  def value_conditions
    split_values.map do |value|
      conditions = ["permission_map = '#{value[:permission_map]}' AND principal_id = #{value[:principal_id]}"]

      conditions << if value[:context_id]
                      ["project_id = #{value[:context_id]}"]
                    else
                      ["project_id IS NULL"]
                    end

      "(#{conditions.join(' AND ')})"
    end
  end
end
